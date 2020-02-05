json.(volunteer,
  :id,
  :username,
  :avatar_25,
  :avatar_50,
  )

if volunteer.try(:volunteer_date)
  json.volunteer_date volunteer.volunteer_date
end