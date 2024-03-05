using Microsoft.AspNetCore.SignalR;

namespace SingalRChatApp.Hubs
{
    public class ChatHub:Hub
    {
        private static Dictionary<string, string > connectedClients = new Dictionary<string, string>();
        public async Task SendMessage (string user, string message)
        {
            await Clients.All.SendAsync ("ReceivedMessage",user,message );
        }
        public async Task JoinChat(string user, string message)
        {

            await Clients.Others.SendAsync("ReceivedMessage", user, message);
        }
        private async Task LeaveChat()
        {
            if (connectedClients.TryGetValue(Context.ConnectionId, out string user))
            {
                var message = $"{user} left the chat!!!";
                await Clients.Others.SendAsync("ReceivedMessage", user, message);
            }
          
        }
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await LeaveChat();
            await base.OnDisconnectedAsync(exception);
        }
        public async Task SendFile(string user, string fileName, byte[] filedata)
        {
            await Clients.All.SendAsync("ReceivedFile",user, fileName, filedata);
        }
    }
}
