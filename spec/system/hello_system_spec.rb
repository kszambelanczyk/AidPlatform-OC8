require "rails_helper"

RSpec.describe "Hello", type: :system do
  it 'it displays index page' do
    visit "/"
    expect(page).to have_text("About Thank.You")
  end
end