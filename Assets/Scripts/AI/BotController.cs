using UnityEngine;
using UnityEngine.AI;

[RequireComponent(typeof(NavMeshAgent))]
public class BotController : MonoBehaviour, IDamageable {
    public Transform[] waypoints; int i; NavMeshAgent agent; public Health health; public Team team;
    public Transform target; public float vision = 30f;
    public BotShooter shooter;

    void Awake(){ agent = GetComponent<NavMeshAgent>(); health = GetComponent<Health>(); }
    void Start(){ if(waypoints!=null && waypoints.Length>0) agent.SetDestination(waypoints[0].position); }

    void Update(){
        if(!target) target = FindClosestEnemy();
        if(target){ agent.SetDestination(target.position); if(shooter) shooter.TryShoot(target); }
        else Patrol();
    }

    Transform FindClosestEnemy(){
        float best = Mathf.Infinity; Transform bestT=null;
        foreach(var h in FindObjectsOfType<Health>()){
            if(h.gameObject==gameObject) continue;
            var bc = h.GetComponent<BotController>();
            if(bc && bc.team==team) continue;
            float d = Vector3.Distance(transform.position, h.transform.position);
            if(d<best && d<=vision){ best=d; bestT=h.transform; }
        }
        return bestT;
    }

    void Patrol(){ if(waypoints==null||waypoints.Length==0) return; if(agent.remainingDistance<1f){ i=(i+1)%waypoints.Length; agent.SetDestination(waypoints[i].position);} }

    public void TakeDamage(float dmg, GameObject instigator=null){ if(health) health.TakeDamage(dmg, instigator); }
}
