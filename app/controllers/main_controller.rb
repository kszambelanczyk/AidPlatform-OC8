class MainController < ProtectedController
  layout "main"

  def index

    @preloaded_data = {
      avatar_img_url: current_user.avatar.url,
      avatar_img_25_url: current_user.avatar.thumb_25.url,
      avatar_img_50_url: current_user.avatar.thumb_50.url,
      avatar_img_128_url: current_user.avatar.thumb_128.url
    }
  end
    
end
