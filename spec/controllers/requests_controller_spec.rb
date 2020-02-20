require 'rails_helper'

RSpec.describe Api::RequestsController, type: :controller do
  render_views
  login_user

  describe "GET index" do
    it "has a 200 status code" do
      get :index
      expect(response.status).to eq(200)
    end

    it "returns an array" do
      get :index
      data = JSON.parse(response.body)
      expect(data.key?("requests")).to be true
      expect(data["requests"].kind_of?(Array)).to be true
    end
  end

  describe "GET show" do
    it "has a 200 status code" do
      request = build(:request)
      request.requester = controller.current_user
      request.save
      get :show, params: {id: request.id}
      expect(response.status).to eq(200)
    end

    it "returns json request object" do
      request = build(:request)
      request.requester = controller.current_user
      request.save
      get :show, params: {id: request.id}
      data = JSON.parse(response.body)
      expect(data.key?("request")).to be true
    end

  end


end
