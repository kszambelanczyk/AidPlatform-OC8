class Api::UsersController < ProtectedController


  def update_password
    user = current_user
    unless user.valid_password?(params[:user][:current_password])
      render json: {errors: { current_password: 'Wrong password' }}, :status => 400
      return 
    end

    if user.update(user_params)
      # Sign in the user by passing validation in case their password changed
      bypass_sign_in(user)
      render
      return 
    else
      render json: { errors:  user.errors }, status: :unprocessable_entity
    end
  end

  def avatar
    current_user.avatar = params[:file]
    if current_user.save
      render json: {
        avatar_img_url: current_user.avatar.url,
        avatar_img_25_url: current_user.avatar.thumb_25.url,
        avatar_img_50_url: current_user.avatar.thumb_50.url,
        avatar_img_128_url: current_user.avatar.thumb_128.url
      }

    else
      render json: { errors:  current_user.errors }, status: :unprocessable_entity
    end

  end


  private

  def user_params
    params.require(:user).except(:current_password).permit(:password, :password_confirmation)
  end

end
