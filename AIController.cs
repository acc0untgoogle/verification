using UnityEngine;
using UnityEngine.AI;

public class AIController : MonoBehaviour
{
    [Header("AI Settings")]
    public float sightRange = 20f;
    public float attackRange = 15f;
    public float patrolSpeed = 3f;
    public float chaseSpeed = 5f;
    public float rotationSpeed = 5f;
    
    [Header("Waypoints")]
    public Transform[] patrolPoints;
    
    private NavMeshAgent agent;
    private Transform player;
    private AIState currentState;
    private int currentPatrolIndex;
    
    private void Start()
    {
        agent = GetComponent<NavMeshAgent>();
        player = GameObject.FindGameObjectWithTag("Player").transform;
        currentState = AIState.Patrol;
        currentPatrolIndex = 0;
        
        if (patrolPoints.Length > 0)
            agent.SetDestination(patrolPoints[currentPatrolIndex].position);
    }
    
    private void Update()
    {
        float distanceToPlayer = Vector3.Distance(transform.position, player.position);
        
        switch (currentState)
        {
            case AIState.Patrol:
                PatrolState(distanceToPlayer);
                break;
            case AIState.Chase:
                ChaseState(distanceToPlayer);
                break;
            case AIState.Attack:
                AttackState(distanceToPlayer);
                break;
        }
    }
    
    private void PatrolState(float distanceToPlayer)
    {
        agent.speed = patrolSpeed;
        
        if (distanceToPlayer <= sightRange)
        {
            currentState = AIState.Chase;
            return;
        }
        
        if (!agent.pathPending && agent.remainingDistance < 0.5f)
        {
            currentPatrolIndex = (currentPatrolIndex + 1) % patrolPoints.Length;
            agent.SetDestination(patrolPoints[currentPatrolIndex].position);
        }
    }
    
    private void ChaseState(float distanceToPlayer)
    {
        agent.speed = chaseSpeed;
        agent.SetDestination(player.position);
        
        if (distanceToPlayer > sightRange * 1.2f)
        {
            currentState = AIState.Patrol;
            agent.SetDestination(patrolPoints[currentPatrolIndex].position);
        }
        else if (distanceToPlayer <= attackRange)
        {
            currentState = AIState.Attack;
        }
    }
    
    private void AttackState(float distanceToPlayer)
    {
        agent.SetDestination(transform.position); // Stop moving
        
        // Face the player
        Vector3 direction = (player.position - transform.position).normalized;
        Quaternion lookRotation = Quaternion.LookRotation(new Vector3(direction.x, 0, direction.z));
        transform.rotation = Quaternion.Slerp(transform.rotation, lookRotation, Time.deltaTime * rotationSpeed);
        
        // Attack logic here
        
        if (distanceToPlayer > attackRange * 1.1f)
        {
            currentState = AIState.Chase;
        }
        else if (distanceToPlayer > sightRange * 1.2f)
        {
            currentState = AIState.Patrol;
            agent.SetDestination(patrolPoints[currentPatrolIndex].position);
        }
    }
    
    private enum AIState { Patrol, Chase, Attack }
}
