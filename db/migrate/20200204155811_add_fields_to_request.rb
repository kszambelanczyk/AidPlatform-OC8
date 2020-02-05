class AddFieldsToRequest < ActiveRecord::Migration[6.0]
  def change
    add_column :requests, :published, :boolean, default: true
  end
end
