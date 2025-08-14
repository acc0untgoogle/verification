using UnityEngine;

public class Grenade_HE : Grenade {
    public float radius=5f; public float damage=80f; public LayerMask mask;
    protected override void Explode(){
        foreach(var c in Physics.OverlapSphere(transform.position, radius, mask)){
            if(c.TryGetComponent<IDamageable>(out var d)){
                float dist = Vector3.Distance(transform.position, c.transform.position);
                float falloff = Mathf.Clamp01(1f - dist/radius);
                d.TakeDamage(damage * falloff, gameObject);
            }
        }
    }
}
