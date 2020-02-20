FactoryBot.define do
  factory :request do
    title { "title" }
    description { "description" }
    request_type { "one_time_task" }
    address { "address" }
    lnglat { "POINT(-122 47)" }
  end
end
