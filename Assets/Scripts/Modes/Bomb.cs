using UnityEngine;

public class Bomb : MonoBehaviour, IDamageable {
    public float timer = 40f; public float radius = 10f; public float damage = 200f; public LayerMask mask;
    float t; bool planted;
    public void Plant(Vector3 pos){ transform.position = pos; planted = true; t = 0f; }
    void Update(){ if(planted){ t += Time.deltaTime; if(t>=timer) Explode(); } }
    void Explode(){
        foreach(var c in Physics.OverlapSphere(transform.position, radius, mask))
            if(c.TryGetComponent<IDamageable>(out var d)) d.TakeDamage(damage, gameObject);
        Destroy(gameObject);
    }
    public void TakeDamage(float dmg, GameObject instigator=null){ /* optional: allow/disallow damage */ }
}
