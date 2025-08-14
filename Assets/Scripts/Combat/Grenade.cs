using UnityEngine;

public abstract class Grenade : MonoBehaviour {
    public float fuse = 3f; protected float t;
    public static System.Action<Vector3, Vector3> ThrowFrom;
    protected virtual void Awake(){ }
    protected virtual void Start(){ }
    protected virtual void Update(){ t+=Time.deltaTime; if(t>=fuse){ Explode(); Destroy(gameObject); } }
    protected abstract void Explode();
}
