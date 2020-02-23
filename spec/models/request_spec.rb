require 'rails_helper'

RSpec.describe Request, type: :model do
  subject { described_class.new }

  context do
    before {
      subject.title = "Sample title"
      subject.description = "Sample description"
      subject.lnglat = "POINT(-122 47)"
      subject.address = "Sample address"
      subject.request_type = "material_need"
      subject.requester = User.new
    }

    it "is valid with valid attributes" do
      expect(subject).to be_valid
    end

    it "is not valid without a title" do
      subject.title = nil
      expect(subject).to_not be_valid
    end

    it "is not valid with a title beeing too short" do
      subject.title = "t"
      expect(subject).to_not be_valid
    end

    it "is not valid with a title beeing too long" do
      subject.title = "s" * 60
      expect(subject).to_not be_valid
    end

    it "is not valid without a description" do
      subject.description = nil
      expect(subject).to_not be_valid
    end

    it "is not valid with a description beeing too short" do
      subject.description = "t"
      expect(subject).to_not be_valid
    end

    it "is not valid with a description beeing too long" do
      subject.description = "s" * 310
      expect(subject).to_not be_valid
    end

    it "is not valid without a lnglat" do
      subject.lnglat = nil
      expect(subject).to_not be_valid
    end

    it "is not valid without a address" do
      subject.address = nil
      expect(subject).to_not be_valid
    end

    it "is not valid without a request_type" do
      subject.request_type = nil
      expect(subject).to_not be_valid
    end

    it "is not valid without a requester" do
      subject.requester = nil
      expect(subject).to_not be_valid
    end

  end

  context "should be unpublished" do
        
    it "when is fulfilled" do
      subject.fulfilled = true
      expect(subject.should_be_unpublished).to be true
    end

    it "when any volunteer marked as fulfilled" do
      subject.fulfilled = false
      subject.volunteer_to_requests << VolunteerToRequest.new({fulfilled: true})
      subject.volunteer_to_requests << VolunteerToRequest.new({fulfilled: false})
      expect(subject.should_be_unpublished).to be true
    end
  
    it "when there are 5 or more volunteers" do
      subject.fulfilled = false
      subject.volunteer_to_requests << VolunteerToRequest.new({fulfilled: false})
      subject.volunteer_to_requests << VolunteerToRequest.new({fulfilled: false})
      subject.volunteer_to_requests << VolunteerToRequest.new({fulfilled: false})
      subject.volunteer_to_requests << VolunteerToRequest.new({fulfilled: false})
      subject.volunteer_to_requests << VolunteerToRequest.new({fulfilled: false})
      expect(subject.should_be_unpublished).to be true
    end

  end

  context "can not be republished" do

    it "when is already published" do
      subject.published = true
      expect(subject.can_be_republished).to_not be true
    end

    it "when is fulfilled" do
      subject.published = false
      subject.fulfilled = true
      expect(subject.can_be_republished).to_not be true
    end

    it "when any volunteer marked as fulfilled" do
      subject.published = false
      subject.volunteer_to_requests << VolunteerToRequest.new({fulfilled: true})
      subject.volunteer_to_requests << VolunteerToRequest.new({fulfilled: false})
      expect(subject.can_be_republished).to_not be true
    end
    
    it "when has 5 or more volunteers and some volunteers are younger then 24h" do
      subject.published = false
      subject.volunteer_to_requests << VolunteerToRequest.new({fulfilled: false, created_at: Time.now - 2.days})
      subject.volunteer_to_requests << VolunteerToRequest.new({fulfilled: false, created_at: Time.now - 2.days})
      subject.volunteer_to_requests << VolunteerToRequest.new({fulfilled: false, created_at: Time.now - 2.days})
      subject.volunteer_to_requests << VolunteerToRequest.new({fulfilled: false, created_at: Time.now - 2.days})
      subject.volunteer_to_requests << VolunteerToRequest.new({fulfilled: false, created_at: Time.now - 2.hours})

      expect(subject.can_be_republished).to_not be true
    end
  end

  context "can be republished" do
    it "when has 5 or more volunteers and all of them did not mark it as fulfilled in the last 24h" do
      subject.published = false
      subject.volunteer_to_requests << VolunteerToRequest.new({fulfilled: false, created_at: Time.now - 2.days})
      subject.volunteer_to_requests << VolunteerToRequest.new({fulfilled: false, created_at: Time.now - 2.days})
      subject.volunteer_to_requests << VolunteerToRequest.new({fulfilled: false, created_at: Time.now - 2.days})
      subject.volunteer_to_requests << VolunteerToRequest.new({fulfilled: false, created_at: Time.now - 2.days})
      subject.volunteer_to_requests << VolunteerToRequest.new({fulfilled: false, created_at: Time.now - 2.days})
      expect(subject.can_be_republished).to be true
    end
  end

  # context "when is_threat_exluded is true" do 
  #   context "without task" do 
  #     it "should be true" do
  #       oc = create(:oc_well)
  #       oc.is_threat_excluded = true
  #       expect(ThreatableThreatExcludedChecker.call(oc)).to be true
  #     end
  #   end
  
  #   context "with not overdue task" do 
  #     it "should be true" do
  #       oc = create(:oc_well)
  #       oc.is_threat_excluded = true
  #       task = create(:task_disable_from_threats_no_recurrence_not_overdue, :taskable => oc)
  #       expect(ThreatableThreatExcludedChecker.call(oc)).to be true
  #     end
  #   end



end
