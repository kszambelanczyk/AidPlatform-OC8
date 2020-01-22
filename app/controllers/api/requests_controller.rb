class Api::RequestsController < ApplicationController


  def map_requests

    unless params.has_key?(:lat_h) && params.has_key?(:lat_l) && params.has_key?(:lng_h) && params.has_key?(:lng_l) 
      render json: {}, status: :unprocessable_entity
      return
    end

    sql = "SELECT * FROM requests WHERE
      requests.lnglat && ST_MakeEnvelope(#{params[:lng_h]}, #{params[:lat_l]}, #{params[:lng_l]}, #{params[:lat_h]}, 4326)"

    @requests = Request.find_by_sql(sql)

    # sql = "SELECT row_to_json(fc)
    #       FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
    #           FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.latlon, 6)::json As geometry
    #               , row_to_json((SELECT l FROM (SELECT id, plan_id, schema_element_id) As l)) As properties
    #             FROM network_locations As lg WHERE
    #             plan_id=#{@network.plan_id} AND schema_element_id=#{@network.id} AND
    #             lg.latlon && ST_MakeEnvelope(#{south_west[:lng]}, #{south_west[:lat]}, #{north_east[:lng]}, #{north_east[:lat]}, 4326)
    #             ) As f) As fc;"


    render :index
  end

  def show
    @request = Request.where('id=? and requester_id=?',params[:id],current_user.id).first
  end

  def index
    @requests = Request.where('requester_id=?', current_user.id)
  end

  def create
    @request = Request.new(request_params)
    @request.requester = current_user

    unless @request.save
      format.json { render json: @request.errors, status: :unprocessable_entity }
    end

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


  private
  def request_params
    data = params.require(:request).permit(
      :title,
      :description,
      :address,
    )

    pos = params.require(:request).permit(
      :lat,
      :lon,
    )
    data[:lnglat] = "POINT(#{pos[:lon]} #{pos[:lat]})" 

    return data
  end

end
