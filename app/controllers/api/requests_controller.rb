class Api::RequestsController < ProtectedController


  def map_requests
    unless params.has_key?(:lat_h) && params.has_key?(:lat_l) && params.has_key?(:lng_h) && params.has_key?(:lng_l) 
      render json: {}, status: :unprocessable_entity
      return
    end

    @requests = Request.select("requests.*, COUNT(c1.id) as volunteer_count, COUNT(c2.id) as volunteered")
      .joins("LEFT JOIN volunteer_to_requests as c1 ON c1.request_id = requests.id")
      .joins("LEFT JOIN volunteer_to_requests as c2 ON c2.request_id = requests.id AND c2.volunteer_id=#{current_user.id}")
      .where("published IS TRUE AND
        requests.lnglat && ST_MakeEnvelope(?, ?, ?, ?, 4326)",params[:lng_h], params[:lat_l], params[:lng_l], params[:lat_h]
        )
      .group("requests.id")

    @requests_count = Request.not_fulfilled.count
    
  end


  def show
    @request = Request.find(params[:id])
    if(@request.requester_id!=current_user.id)
      head :forbidden
      return
    end

    @volunteers = User.select("users.*, c1.created_at as volunteer_date")
      .joins("LEFT JOIN volunteer_to_requests as c1 ON c1.volunteer_id = users.id")
      .where("c1.request_id=?", @request.id)
      .order("c1.created_at DESC")

    @can_be_republished = @request.can_be_republished
  end


  def index
    @requests = Request.select("requests.*, COUNT(c1.id) as volunteer_count, BOOL_OR(c2.fulfilled) as volunteer_fulfilled")
      .joins("LEFT JOIN volunteer_to_requests as c1 ON c1.request_id = requests.id")
      .joins("LEFT JOIN volunteer_to_requests as c2 ON c2.request_id = requests.id")
      .where("requester_id=?", current_user.id)
      .group("requests.id")
      .order("requests.created_at DESC")
    
    @requests_count = Request.where('requester_id=?', current_user.id).count
  end


  def create
    @request = Request.new(request_params)
    @request.requester = current_user

    unless @request.save
      render json: @request.errors, status: :unprocessable_entity
    end

    Pusher.trigger('map_status', 'reqest_count_change', {
      message: Request.not_fulfilled.count
    })

    render :show
  end


  def update
    @request = Request.find(params[:id])
    if(@request.requester_id!=current_user.id)
      head :forbidden
      return
    end

    unless @request.update(request_params)
      render json: @request.errors, status: :unprocessable_entity
      return
    end

    render :show
  end


  def destroy
    request = Request.find(params[:id])

    if(request.requester_id!=current_user.id)
      head :forbidden
      return
    end

    unless request.destroy
      render json: { errors:  request.errors }, status: :unprocessable_entity
      return
    end

    Pusher.trigger('map_status', 'reqest_count_change', {
      message: Request.not_fulfilled.count
    })
  end


  def volunteering_requests
    @requests = Request.includes(:requester).select("requests.*, c1.created_at as volunteer_date, c1.fulfilled as volunteer_fulfilled")
      .joins("LEFT JOIN volunteer_to_requests as c1 ON c1.request_id = requests.id")
      .where("c1.volunteer_id=?", current_user.id)
      .order("c1.created_at DESC")

    @requests_count = current_user.volunteer_requests.count
  end


  def volunteering_request
    @request = Request.find(params[:id])

    # did I volunteer to that request?
    if (@request.volunteer_to_requests.none? {|v| v.volunteer_id==current_user.id})
      head :forbidden
      return
    end
  end


  def sign_to_volunteer
    @request = Request.find(params[:id])

    if (@request.requester_id == current_user.id)
      render json: { errors:  ['Can not volunteer for your own request'] }, status: :unprocessable_entity
      return
    end

    if current_user.volunteer_requests.pluck(:id).any? {|id| id==@request.id}
      render json: { errors:  ['Already volunteered to that request'] }, status: :unprocessable_entity
      return
    end

    current_user.volunteer_requests << @request

    # there could be to many volunteers 
    @request.update_published_state()
    @request.save

  end

  def unvolunteer
    @request = Request.find(params[:id])

    if (@request.requester_id == current_user.id)
      render json: { errors:  ['Can not unvolunteer for your own request'] }, status: :unprocessable_entity
      return
    end

    if current_user.volunteer_requests.pluck(:id).none? {|id| id==@request.id}
      render json: { errors:  ['You are not volunteered to that request'] }, status: :unprocessable_entity
      return
    end

    VolunteerToRequest.where('request_id=? and volunteer_id=?',@request.id, current_user.id).destroy_all

  end



  def toggle_fulfilled
    @request = Request.find(params[:id])

    if(@request.requester_id!=current_user.id)
      head :forbidden
      return
    end

    @request.fulfilled = !@request.fulfilled

    if (@request.should_be_unpublished)
      @request.published = false
    end
    
    unless @request.save
      render json: @request.errors, status: :unprocessable_entity
      return
    end

    render :show
  end


  def republish
    @request = Request.find(params[:id])

    if(@request.requester_id!=current_user.id)
      head :forbidden
      return
    end

    result = @request.can_be_republished
    unless result==true
      # render json: result, status: :unprocessable_entity
      render :show
      return
    end

    @request.published = true
    
    begin
      Request.transaction do
        # update published flag
        result = @request.save

        # remove all volunteers
        result = result && VolunteerToRequest.where('request_id=?', @request.id).destroy_all
        raise "Transaction Failed" unless result
      end
    rescue => e
      render json: {errors:e}, status: :unprocessable_entity
      return
    end

    render :show
  end


  def toggle_volunteer_fulfilled
    @request = Request.find(params[:id])

    if (@request.requester_id == current_user.id)
      render json: { errors:  ['Can not volunteer fulfill your own request'] }, status: :unprocessable_entity
      return
    end

    volunteer_to_request = current_user.volunteer_to_requests.find { |v| v.request_id=@request.id}
    unless volunteer_to_request
      render json: { errors:  ['You did not volunteer to that request'] }, status: :unprocessable_entity
      return
    end

    volunteer_to_request.fulfilled = !volunteer_to_request.fulfilled

    begin
      VolunteerToRequest.transaction do
        result = volunteer_to_request.save
        @request.update_published_state()
        result = result && @request.save
        raise "Transaction Failed" unless result
      end
    rescue => e
      render json: {errors:e}, status: :unprocessable_entity
      return
    end

    render :show_volunteer_request
  end

  private
  def request_params
    data = params.require(:request).permit(
      :title,
      :description,
      :address,
      :request_type,
    )

    pos = params.require(:request).permit(
      :lat,
      :lng,
    )
    data[:lnglat] = "POINT(#{pos[:lng]} #{pos[:lat]})" 

    return data
  end

end
