json.request do
  json.partial! partial: 'api/requests/request', locals: {request: @request}
end

if @volunteers
  json.volunteers @volunteers, partial: 'api/requests/volunteer', as: :volunteer
end


