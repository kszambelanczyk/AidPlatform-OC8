class CreateVolunteerToRequests < ActiveRecord::Migration[6.0]
  def change
    create_table :volunteer_to_requests do |t|

      t.references :request, foreign_key: true
      t.references :volunteer, foreign_key: { to_table: :users }

      t.timestamps
    end
  end
end
