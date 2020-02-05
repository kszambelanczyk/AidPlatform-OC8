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

  attr_accessor :volunteer_count

  def lat
    self[:lnglat].y
  end

  def lng
    self[:lnglat].x
  end

  def is_my_request(user)
    user.id==self.requester_id
  end

  def should_be_unpublished
    # if requester mark as fulfilled
    if(self.fulfilled)
      return true      
    end
    
    # if any volunteer mark as fulfilled
    if(self.volunteer_to_requests.any?{|v| v.fulfilled })
      return true      
    end

    # if there are 5 or more volunteers
    if(self.volunteer_to_requests.length>4)
      return true      
    end

    return false
  end

end
