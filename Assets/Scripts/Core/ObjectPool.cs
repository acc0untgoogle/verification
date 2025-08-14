using System.Collections.Generic;
using UnityEngine;

public class ObjectPool : MonoBehaviour {
    [SerializeField] GameObject prefab;
    [SerializeField] int initial = 16;
    readonly Queue<GameObject> q = new();

    void Awake(){
        for(int i=0;i<initial;i++) q.Enqueue(New());
    }

    GameObject New(){ var go = Instantiate(prefab, transform); go.SetActive(false); return go; }

    public GameObject Get(Vector3 pos, Quaternion rot){
        var go = q.Count>0? q.Dequeue(): New();
        go.transform.SetPositionAndRotation(pos, rot);
        go.SetActive(true);
        return go;
    }
    public void Release(GameObject go){ go.SetActive(false); q.Enqueue(go); }
}
