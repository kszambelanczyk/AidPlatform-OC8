class AddFulfilledToVolunteerToRequests < ActiveRecord::Migration[6.0]
  def change
    add_column :volunteer_to_requests, :fulfilled, :boolean, default: false
  end
end
