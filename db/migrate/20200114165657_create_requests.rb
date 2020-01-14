class CreateRequests < ActiveRecord::Migration[6.0]
  def change
    create_table :requests do |t|
      t.string :request_type
      t.string :title
      t.text :description
      t.st_point :lnglat, geographic: true
    
      t.boolean :fulfilled, :default => false

      t.references :requester, foreign_key: { to_table: :users }

      t.timestamps
    end
  end
end
