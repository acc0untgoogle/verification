using UnityEngine;

public class BotShooter : MonoBehaviour {
    public WeaponBase weapon; public Transform head;
    public void TryShoot(Transform target){ if(!weapon||!target||!head) return; AimAt(target.position); weapon.Tick(true, false, true); }
    void AimAt(Vector3 world){ Vector3 dir = (world - head.position).normalized; head.rotation = Quaternion.LookRotation(dir); }
}
