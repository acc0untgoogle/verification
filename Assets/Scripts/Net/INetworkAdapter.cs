public interface INetworkAdapter {
    void Connect(string roomId);
    void Send(string channel, byte[] payload);
    void On(string channel, System.Action<byte[]> handler);
}
