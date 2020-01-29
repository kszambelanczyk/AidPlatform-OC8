class Request < ApplicationRecord

  belongs_to :requester, class_name: "User"

  has_many :volunteer_to_requests, dependent: :destroy
  has_many :volunteers, through: :volunteer_to_requests, class_name: 'User', source: :volunteer

  scope :not_fulfilled, -> { where(fulfilled: false) }

  REQUEST_TYPES = {
    one_time_task: 'one_time_task',
    material_need: 'material_need'
  }

  validates :title, presence: true, length: { minimum: 2, maximum: 50 }
  validates :description, presence:true, length: { minimum: 2, maximum: 300 }
  validates :lnglat, presence: true
  validates :address, presence: true
  validates_inclusion_of :request_type, in: [ REQUEST_TYPES[:one_time_task], REQUEST_TYPES[:material_need] ]


  def lat
    self[:lnglat].y
  end

  def lng
    self[:lnglat].x
  end

end
