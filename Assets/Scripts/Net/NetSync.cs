using UnityEngine;

public class NetSync : MonoBehaviour {
    public INetworkAdapter net; public string channel = "transform"; float sendRate=0.05f; float t;
    void Update(){ t+=Time.deltaTime; if(t>=sendRate){ t=0; var p = transform.position; var r = transform.rotation; var data = Serialize(p,r); net?.Send(channel, data);} }
    public void OnRemote(byte[] payload){ (Vector3 p, Quaternion r) = Deserialize(payload); transform.SetPositionAndRotation(p,r); }

    byte[] Serialize(Vector3 p, Quaternion r){ var bytes = new byte[28];
        System.Buffer.BlockCopy(System.BitConverter.GetBytes(p.x),0,bytes,0,4);
        System.Buffer.BlockCopy(System.BitConverter.GetBytes(p.y),0,bytes,4,4);
        System.Buffer.BlockCopy(System.BitConverter.GetBytes(p.z),0,bytes,8,4);
        System.Buffer.BlockCopy(System.BitConverter.GetBytes(r.x),0,bytes,12,4);
        System.Buffer.BlockCopy(System.BitConverter.GetBytes(r.y),0,bytes,16,4);
        System.Buffer.BlockCopy(System.BitConverter.GetBytes(r.z),0,bytes,20,4);
        System.Buffer.BlockCopy(System.BitConverter.GetBytes(r.w),0,bytes,24,4);
        return bytes;
    }
    (Vector3, Quaternion) Deserialize(byte[] b){
        float x = System.BitConverter.ToSingle(b,0), y=System.BitConverter.ToSingle(b,4), z=System.BitConverter.ToSingle(b,8);
        float qx=System.BitConverter.ToSingle(b,12), qy=System.BitConverter.ToSingle(b,16), qz=System.BitConverter.ToSingle(b,20), qw=System.BitConverter.ToSingle(b,24);
        return (new Vector3(x,y,z), new Quaternion(qx,qy,qz,qw));
    }
}
