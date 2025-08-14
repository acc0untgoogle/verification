using UnityEngine;

public class DeathmatchMode : MonoBehaviour {
    public Transform[] spawnPoints;
    public void Respawn(GameObject player){
        if(spawnPoints==null || spawnPoints.Length==0) return;
        int i = Random.Range(0, spawnPoints.Length);
        player.transform.SetPositionAndRotation(spawnPoints[i].position, spawnPoints[i].rotation);
        var h = player.GetComponent<Health>(); if(h) h.Heal(9999);
    }
}
