class Request < ApplicationRecord

  belongs_to :requester, class_name: "User"

  has_many :volunteer_to_requests, dependent: :destroy
  has_many :volunteers, through: :volunteer_to_requests, class_name: 'User', source: :volunteer


  def lat
    self[:lnglat].y
  end

  def lng
    self[:lnglat].x
  end

end
