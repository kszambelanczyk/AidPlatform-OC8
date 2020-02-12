require 'pusher'

Pusher.app_id = ENV['PUSHER_APP_ID']
Pusher.key = ENV['PUSHER_API']
Pusher.secret = ENV['PUSHER_SECRET']
Pusher.cluster = 'eu'
Pusher.logger = Rails.logger
Pusher.encrypted = true