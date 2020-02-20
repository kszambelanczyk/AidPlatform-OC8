FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "test-#{n.to_s.rjust(3,"0")}@sample.com"}
    username { "User_1" }
    password { "sdhlh23DFG0" }
    id_document { Rack::Test::UploadedFile.new(File.open(File.join(Rails.root, '/spec/fixtures/myfiles/myfile.jpg'))) }
  end
end
