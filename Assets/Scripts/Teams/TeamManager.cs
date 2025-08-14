using UnityEngine;

public class TeamManager : MonoBehaviour {
    public Material tMat, ctMat;
    public void ApplyTeamVisual(GameObject target, Team team){
        var r = target.GetComponentInChildren<Renderer>(); if(!r) return;
        r.sharedMaterial = (team==Team.Terrorists)? tMat: ctMat;
    }
}
