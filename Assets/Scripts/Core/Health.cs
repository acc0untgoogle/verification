using UnityEngine;
using UnityEngine.Events;

public class Health : MonoBehaviour, IDamageable {
    [SerializeField] float maxHealth = 100f;
    public float Current { get; private set; }
    public UnityEvent OnDeath;
    public UnityEvent<float> OnDamaged;

    void Awake(){ Current = maxHealth; }

    public void TakeDamage(float dmg, GameObject instigator = null){
        if(Current <= 0) return;
        Current -= dmg;
        OnDamaged?.Invoke(dmg);
        if(Current <= 0){
            Current = 0;
            OnDeath?.Invoke();
        }
    }

    public void Heal(float v){ Current = Mathf.Clamp(Current + v, 0, maxHealth); }
}
