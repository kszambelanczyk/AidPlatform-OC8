class Api::RequestsController < ProtectedController


  def map_requests

    unless params.has_key?(:lat_h) && params.has_key?(:lat_l) && params.has_key?(:lng_h) && params.has_key?(:lng_l) 
      render json: {}, status: :unprocessable_entity
      return
    end

    sql = "SELECT * FROM requests WHERE
      fulfilled IS FALSE AND
      requests.lnglat && ST_MakeEnvelope(#{params[:lng_h]}, #{params[:lat_l]}, #{params[:lng_l]}, #{params[:lat_h]}, 4326)"

    @requests = Request.find_by_sql(sql)

    @requests_count = Request.not_fulfilled.count

    render :index
  end

  def show
    @request = Request.where('id=? and requester_id=?',params[:id],current_user.id).first
  end

  def index
    @requests = Request.where('requester_id=?', current_user.id)
    @requests_count = @requests.count

  end

  def create
    @request = Request.new(request_params)
    @request.requester = current_user

    unless @request.save
      format.json { render json: @request.errors, status: :unprocessable_entity }
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
      format.json { render json: @request.errors, status: :unprocessable_entity }
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
