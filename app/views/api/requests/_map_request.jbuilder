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

if request.try(:volunteered)
  json.volunteered request.volunteered>0
end

json.requester_username request.requester.username
json.requester_avatar_50 request.requester.avatar_50


