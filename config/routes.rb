Rails.application.routes.draw do
  devise_for :users

  # devise_for :users, controllers: { passwords: 'users/passwords' }

  get 'entry/index'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  root "entry#index"

  get 'about', to: "entry#about"
  get 'contact', to: "entry#contact"

  get 'main', to: "main#index"
  get 'main/*other', to: "main#index"

  namespace :api do
    resources :requests do
      member do 
        post 'sign_to_volunteer'
      end

      member do 
        post 'toggle_fulfilled'
      end
    end

    get 'volunteering_requests', to: "requests#volunteering_requests"
    
    get 'map_requests', to: "requests#map_requests"

    resource :user do
      collection do
        patch 'update_password'
        post 'avatar'
      end
    end


  end


end
