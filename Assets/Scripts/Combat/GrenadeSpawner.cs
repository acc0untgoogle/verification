using UnityEngine;

public class GrenadeSpawner : MonoBehaviour {
    public GameObject hePrefab, flashPrefab, smokePrefab; 
    void Awake(){
        Grenade.ThrowFrom = (pos, dir)=>{
            var prefab = hePrefab; 
            var g = Instantiate(prefab, pos, Quaternion.identity);
            var rb = g.GetComponent<Rigidbody>(); if(rb) rb.AddForce(dir.normalized*12f, ForceMode.VelocityChange);
        };
    }
}
