json.(request,
  :id,
  :title,
  :description,
  :lat,
  :lng,
  :address,
  :request_type,
  :published,
  :fulfilled,
  :created_at
  )

json.is_my_request request.is_my_request(current_user)

if request.try(:volunteer_count)
  volunteer_count = request.volunteer_count
else
  volunteer_count = request.volunteer_to_requests.count
end
json.volunteer_count volunteer_count

if volunteer_count>0 
  if request.try(:volunteer_fulfilled)
    json.volunteer_fulfilled request.volunteer_fulfilled
  else
    json.volunteer_fulfilled request.volunteer_to_requests.any? {|v| v.fulfilled }
  end
else
  json.volunteer_fulfilled false
end
# if request.try(:volunteer_count)
#   json.volunteer_count request.volunteer_count
# else
#   json.volunteer_count request.volunteer_to_requests.count
# end

if request.try(:volunteered)
  json.volunteered request.volunteered>0
end

if request.try(:volunteer_date)
  json.volunteer_date request.volunteer_date
end


