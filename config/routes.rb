Rails.application.routes.draw do
  devise_for :users
  get 'entry/index'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  root "entry#index"

  get 'about', to: "entry#about"
  get 'contact', to: "entry#contact"

  get 'main', to: "main#index"
  get 'main/*other', to: "main#index"

  namespace :api do
    resources :requests
    get 'map_requests', to: "requests#map_requests"
  end


end
