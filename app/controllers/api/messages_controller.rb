class Api::MessagesController < ProtectedController

  def get_recipients
    @recipients = my_recipients()

    #senders of unread messages
    sendersId = Message.select('DISTINCT sender_id').where('recipient_id=? AND readed=false', current_user.id)

    @recipients.each{|r|
      if sendersId.any?{|s| s.sender_id==r.id}
        r.unreaded_messages = true
      else
        r.unreaded_messages = false
      end
    }

  end

  # get user messages
  def user
    recipient = User.find(params[:id])

    unless can_talk_to?(recipient.id)
      head :forbidden
      return
    end

    @messages = read_messages(recipient.id, params[:last_message_id])
  end

  def create
    params.require([:message, :recipient_id])

    recipients = my_recipients()
    if recipients.none?{|r| r.id==params[:recipient_id].to_i}
      head :forbidden
      return
    end

    message = Message.new()
    message.message = params[:message]
    message.readed = false
    message.sender_id = current_user.id
    message.recipient_id = params[:recipient_id]

    unless message.save
      render json: message.errors, status: :unprocessable_entity
    end

    Pusher.trigger("chat_user_#{params[:recipient_id]}", "new_message", {
      sender_id: current_user.id
    })

    @messages = read_messages(params[:recipient_id], params[:last_message_id])
    render :user
end

  private
  def can_talk_to?(id)
    return my_recipients.any?{|u| u.id==id}
  end

  def my_recipients
    # get available recipients: 
    # recipients from previous messages 
    # people who are volunteering user requests,
    # people that user is doing volunteering

    sql = <<-SQL
      SELECT DISTINCT a.id, a.username, a.avatar FROM
        (SELECT users.*, messages.created_at as d FROM users
        JOIN messages ON messages.recipient_id = users.id
        WHERE messages.sender_id=#{current_user.id}
        UNION
        SELECT users.*, messages.created_at as d FROM users
        JOIN messages ON messages.sender_id = users.id
        WHERE messages.recipient_id=#{current_user.id}
        ORDER BY d DESC) a
    SQL

    recipients = User.find_by_sql(sql).to_a

    volunteering_people = User
      .joins("LEFT JOIN volunteer_to_requests ON volunteer_to_requests.volunteer_id = users.id")
      .joins("JOIN requests ON volunteer_to_requests.request_id = requests.id")
      .where("requests.requester_id=?", current_user.id)
    # recipients += volunteering_people.to_a
    volunteering_people.each {|r| 
      if recipients.none?{|r2| r2.id==r.id}
        recipients << r
      end
    }
    
    requesters = User
      .joins("JOIN requests ON requests.requester_id = users.id")
      .joins("LEFT JOIN volunteer_to_requests ON volunteer_to_requests.request_id = requests.id")
      .where("volunteer_to_requests.volunteer_id=?", current_user.id)
    requesters.each {|r| 
      if recipients.none?{|r2| r2.id==r.id}
        recipients << r
      end
    }

    return recipients
  end

  private
  def read_messages(recipient_id, message_id=nil)
    messages = Message.where('((recipient_id=? AND sender_id=?) OR (recipient_id=? AND sender_id=?))',
                  current_user.id, recipient_id, recipient_id, current_user.id)

    if message_id
      messages = messages.where('id>?', message_id)
      # update messages flag that they are readed
      Message.where('((recipient_id=? AND sender_id=?)) AND id>? AND readed=?',current_user.id, recipient_id, message_id, false)
              .update_all({readed: true, read_date: Time.now})
    else
      # update messages flag that they are readed
      Message.where('((recipient_id=? AND sender_id=?)) AND readed=?',current_user.id, recipient_id, false)
              .update_all({readed: true, read_date: Time.now})
    end

    messages = messages.order('created_at asc')

    return messages
  end


  def message_params
    data = params.require(:request).permit(
      :title,
      :description,
      :address,
      :request_type,
    )
    return data
  end


end
