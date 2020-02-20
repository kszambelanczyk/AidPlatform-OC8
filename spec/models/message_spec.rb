require 'rails_helper'

RSpec.describe Message, type: :model do

  subject { described_class.new }

  context do
    before {
      subject.message = "message"
      subject.readed = false
      subject.sender = User.new({username: 'user1'})
      subject.recipient = User.new({username: 'user2'})
    }

    it "is valid with valid attributes" do
      expect(subject).to be_valid
    end

    it "is not valid without a sender" do
      subject.sender = nil
      expect(subject).to_not be_valid
    end

    it "is not valid without a recipient" do
      subject.recipient = nil
      expect(subject).to_not be_valid
    end


  end

end
