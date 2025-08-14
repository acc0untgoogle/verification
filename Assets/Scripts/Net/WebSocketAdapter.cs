using System;

public class WebSocketAdapter : INetworkAdapter {
    public void Connect(string roomId){ /* TODO: Implement WebSocket connection */ }
    public void Send(string channel, byte[] payload){ /* ws.Send */ }
    public void On(string channel, Action<byte[]> handler){ /* store handlers, invoke on receive */ }
}
