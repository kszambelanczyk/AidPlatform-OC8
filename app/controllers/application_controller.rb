class ApplicationController < ActionController::Base
    layout :layout_by_resource

    before_action :configure_permitted_parameters, if: :devise_controller?

    protected
    def configure_permitted_parameters
      devise_parameter_sanitizer.permit(:sign_up) { |u| u.permit(:username, :email, :password, :id_document)}

      devise_parameter_sanitizer.permit(:account_update) { |u| u.permit(:username, :email, :password, :current_password, :id_document)}
    end

    def after_sign_in_path_for(resource)
      main_path
    end

    def after_sign_up_path_for(resource)
      main_path
    end

    def after_sign_out_path_for(resource)
      root_path
    end

    private
    def layout_by_resource
      if devise_controller?
        "devise"
      else
        "application"
      end
    end
end
