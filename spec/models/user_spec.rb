require 'rails_helper'

RSpec.describe User, type: :model do

  subject { described_class.new }

  context do
    before {
      subject.username = "Username"
      subject.id_document = Rack::Test::UploadedFile.new(File.open(File.join(Rails.root, '/spec/fixtures/myfiles/myfile.jpg')))
      subject.email = "sample@email.com"
      subject.password = "abcdefg"
    }

    it "is valid with valid attributes" do
      expect(subject).to be_valid
    end

    it "is not valid without a username" do
      subject.username = nil
      expect(subject).to_not be_valid
    end

    it "is not valid without a email" do
      subject.email = nil
      expect(subject).to_not be_valid
    end

    it "is not valid without a password" do
      subject.password = nil
      expect(subject).to_not be_valid
    end

    it "is not valid without a id document" do
      subject.id_document = nil
      expect(subject).to_not be_valid
    end

  end

end
