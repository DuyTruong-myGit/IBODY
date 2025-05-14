using IBODY_WebAPI.Models;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IBODY_WebAPI.Services
{
    public class ChatMessageService
    {
        private readonly IMongoCollection<ChatMessage> _chatMessages;

        public ChatMessageService(IConfiguration config)
        {
            var client = new MongoClient(config["MongoDB:ConnectionString"]);
            var database = client.GetDatabase(config["MongoDB:Database"]);
            _chatMessages = database.GetCollection<ChatMessage>(config["MongoDB:Collection"]);
        }

        public async Task AddMessage(ChatMessage message) =>
            await _chatMessages.InsertOneAsync(message);

        public async Task<List<ChatMessage>> GetMessages(int user1, int user2)
        {
            var filter = Builders<ChatMessage>.Filter.Or(
                Builders<ChatMessage>.Filter.And(
                    Builders<ChatMessage>.Filter.Eq(m => m.FromUserId, user1),
                    Builders<ChatMessage>.Filter.Eq(m => m.ToUserId, user2)
                ),
                Builders<ChatMessage>.Filter.And(
                    Builders<ChatMessage>.Filter.Eq(m => m.FromUserId, user2),
                    Builders<ChatMessage>.Filter.Eq(m => m.ToUserId, user1)
                )
            );

            return await _chatMessages.Find(filter)
                .SortBy(m => m.Timestamp)
                .ToListAsync();
        }
    }
}
