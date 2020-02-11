class CreateMessages < ActiveRecord::Migration[6.0]
  def change
    create_table :messages do |t|
      t.text :message
      t.boolean :readed, :default => false
      t.datetime :read_date

      t.references :sender, foreign_key: { to_table: :users }
      t.references :recipient, foreign_key: { to_table: :users }

      t.timestamps
    end
  end
end
