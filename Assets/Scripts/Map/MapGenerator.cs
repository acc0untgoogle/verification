using UnityEngine;

public class MapGenerator : MonoBehaviour {
    [SerializeField] int width = 20, length = 20;
    [SerializeField] float cell = 3f;
    [SerializeField] GameObject wallPrefab, floorPrefab, coverPrefab;

    void Start(){
        var floor = Instantiate(floorPrefab, new Vector3((width*cell)/2f, 0, (length*cell)/2f), Quaternion.identity, transform);
        floor.transform.localScale = new Vector3(width*cell, 1, length*cell);

        for(int x=0;x<=width;x++){
            Place(wallPrefab, new Vector3(x*cell, 1, 0));
            Place(wallPrefab, new Vector3(x*cell, 1, length*cell));
        }
        for(int z=0;z<=length;z++){
            Place(wallPrefab, new Vector3(0, 1, z*cell));
            Place(wallPrefab, new Vector3(width*cell, 1, z*cell));
        }
        for(int i=0;i<width*length/6;i++){
            Vector3 p = new(Random.Range(1,width-1)*cell, 0.5f, Random.Range(1,length-1)*cell);
            Place(coverPrefab, p);
        }
    }

    void Place(GameObject prefab, Vector3 pos){ if(prefab) Instantiate(prefab, pos, Quaternion.identity, transform); }
}
