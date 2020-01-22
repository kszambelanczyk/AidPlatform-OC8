class VolunteerToRequest < ApplicationRecord
  belongs_to :request
  belongs_to :volunteer, foreign_key: "volunteer_id", class_name: "User"

end
