# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_02_08_172609) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "postgis"

  create_table "messages", force: :cascade do |t|
    t.text "message"
    t.boolean "readed", default: false
    t.datetime "read_date"
    t.bigint "sender_id"
    t.bigint "recipient_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["recipient_id"], name: "index_messages_on_recipient_id"
    t.index ["sender_id"], name: "index_messages_on_sender_id"
  end

  create_table "requests", force: :cascade do |t|
    t.string "request_type"
    t.string "title"
    t.text "description"
    t.text "address"
    t.geography "lnglat", limit: {:srid=>4326, :type=>"st_point", :geographic=>true}
    t.boolean "fulfilled", default: false
    t.bigint "requester_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.boolean "published", default: true
    t.index ["requester_id"], name: "index_requests_on_requester_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "avatar"
    t.string "id_document"
    t.string "username"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  create_table "volunteer_to_requests", force: :cascade do |t|
    t.bigint "request_id"
    t.bigint "volunteer_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.boolean "fulfilled", default: false
    t.index ["request_id"], name: "index_volunteer_to_requests_on_request_id"
    t.index ["volunteer_id"], name: "index_volunteer_to_requests_on_volunteer_id"
  end

  add_foreign_key "messages", "users", column: "recipient_id"
  add_foreign_key "messages", "users", column: "sender_id"
  add_foreign_key "requests", "users", column: "requester_id"
  add_foreign_key "volunteer_to_requests", "requests"
  add_foreign_key "volunteer_to_requests", "users", column: "volunteer_id"
end
