class MessagesController < ApplicationController
  def index
    @messages = Message.find_all_by_recipient_id(current_user.id)
    @message = Message.new
    @recipients = User.all
    render :index
  end

  def show
    @message = Message.find(params[:id])
    @sender = User.find(@message.sender_id)
    @message.read = true
    @message.save
    render :show
  end

  def new
    @message = Message.new
    @recipients = User.all
    render :new
  end

  def create
    params[:message][:sender_id] = current_user.id
    @message = Message.new(params[:message])
    if @message.save
      msg = NotificationMailer.message_received_email(@message)
      msg.deliver!
      flash[:notice] = ["Message sent!"]
      redirect_to new_message_url
    else
      flash[:errors] ||= []
      flash[:errors] += @message.errors.full_messages
      @recipients = User.all
      render :new
    end
  end

  def destroy
  end
end