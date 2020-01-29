class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :requests, foreign_key: "requester_id"

  has_many :volunteer_to_requests, foreign_key: "volunteer_id", dependent: :destroy
  has_many :volunteer_requests, through: :volunteer_to_requests, class_name: 'Request', source: :request

  mount_uploader :id_document, IdDocumentUploader
  mount_uploader :avatar, AvatarUploader

  validates :id_document, presence: true

end
