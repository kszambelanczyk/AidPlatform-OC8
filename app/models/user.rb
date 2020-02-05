class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :requests, foreign_key: "requester_id", dependent: :destroy

  has_many :volunteer_to_requests, foreign_key: "volunteer_id", dependent: :destroy
  has_many :volunteer_requests, through: :volunteer_to_requests, class_name: 'Request', source: :request

  mount_uploader :id_document, IdDocumentUploader
  mount_uploader :avatar, AvatarUploader

  validates :id_document, presence: true
  validates :username, presence: true
  validates_format_of :username, with: /^[a-zA-Z0-9_\.]*$/, :multiline => true

  def avatar_25
    self.avatar.thumb_25.url
  end

  def avatar_50
    self.avatar.thumb_50.url
  end
end
