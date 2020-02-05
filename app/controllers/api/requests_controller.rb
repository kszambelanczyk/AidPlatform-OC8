class Api::RequestsController < ProtectedController


  def map_requests
    unless params.has_key?(:lat_h) && params.has_key?(:lat_l) && params.has_key?(:lng_h) && params.has_key?(:lng_l) 
      render json: {}, status: :unprocessable_entity
      return
    end

    # sql = "SELECT * FROM requests WHERE
    #   fulfilled IS FALSE AND
    #   requests.lnglat && ST_MakeEnvelope(#{params[:lng_h]}, #{params[:lat_l]}, #{params[:lng_l]}, #{params[:lat_h]}, 4326)"
    # @requests = Request.find_by_sql(sql)

    @requests = Request.select("requests.*, COUNT(c1.id) as volunteer_count, COUNT(c2.id) as volunteered")
      .joins("LEFT JOIN volunteer_to_requests as c1 ON c1.request_id = requests.id")
      .joins("LEFT JOIN volunteer_to_requests as c2 ON c2.request_id = requests.id AND c2.volunteer_id=#{current_user.id}")
      .where("published IS TRUE AND
        requests.lnglat && ST_MakeEnvelope(?, ?, ?, ?, 4326)",params[:lng_h], params[:lat_l], params[:lng_l], params[:lat_h]
        )
      .group("requests.id")

    @requests_count = Request.not_fulfilled.count
    

    render :index
  end

  def show
    @request = Request.find(params[:id])
    if(@request.requester_id!=current_user.id)
      raise ActionController::Forbidden
    end

    @volunteers = User.select("users.*, c1.created_at as volunteer_date")
      .joins("LEFT JOIN volunteer_to_requests as c1 ON c1.volunteer_id = users.id")
      .where("c1.request_id=?", @request.id)
      .order("c1.created_at DESC")

  end

  def index
    # fulfilled = false
    # if(params.has_key?(:fulfilled) && params[:fulfilled]=="true")
    #   fulfilled = true
    # end

    @requests = Request.select("requests.*, COUNT(c1.id) as volunteer_count")
      .joins("LEFT JOIN volunteer_to_requests as c1 ON c1.request_id = requests.id")
      .where('requester_id=?', current_user.id)
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
      raise ActionController::Forbidden
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
      raise ActionController::Forbidden
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

    @requests = Request.includes(:requester).select("requests.*, c1.created_at as volunteer_date")
      .joins("LEFT JOIN volunteer_to_requests as c1 ON c1.request_id = requests.id")
      .where("c1.volunteer_id=?", current_user.id)
      .order("c1.created_at DESC")

    @requests_count = current_user.volunteer_requests.count

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
  end

  def toggle_fulfilled
    @request = Request.find(params[:id])

    if(@request.requester_id!=current_user.id)
      raise ActionController::Forbidden
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
