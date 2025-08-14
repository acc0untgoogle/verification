using System;

public class FirebaseAdapter : INetworkAdapter {
    public void Connect(string roomId){ /* TODO: Implement Firebase presence */ }
    public void Send(string channel, byte[] payload){ /* write doc/rtdb */ }
    public void On(string channel, Action<byte[]> handler){ /* subscribe */ }
}
