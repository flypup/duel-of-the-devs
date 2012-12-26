package {

	public class MapComponent {

		/**
		 * Type of Map Element
		 * wall  (Box)
		 * floor (Plane / Box)
		 * steps (sloped Box / series of Boxes?)
		 * entity (Game Entity instance)
		 * parallax (2d Poster / Tile?)
		 */

		[Inspectable(defaultValue="wall",enumeration="wall,floor,steps,entity,parallax")]
		public var mapType:String = "wall";


		/**
		 * Entity Shape (box, circle)
		 */

		[Inspectable(defaultValue="box",enumeration="box,circle,polygons")]
		public var shape:String = "box";


		/**
		 * Entity Type (Player, Ninja, Monk, Cauldron, LionStatue...)
		 */

		[Inspectable(defaultValue="Box",enumeration="Player,Ninja,Box,Circle")]
		public var type:String = "Box";


		/**
		 * Mass (0 = static)
		 */

		[Inspectable(defaultValue=0.0)]
		public var mass:Number = 0;


		
		/**
		 * Z Position
		 */

		[Inspectable(defaultValue=0.0)]
		public var mZ:Number = 0;


		/**
		 * Box Dimensions (circle radius = mWidth / 2
		 * x axis: mWidth
		 * y axis: mHeight
		 * z axis: mDepth
		 */

		[Inspectable(defaultValue=0.0)]
		public var mWidth:Number = 0;

		[Inspectable(defaultValue=64)]
		public var mHeight:Number = 64;

		[Inspectable(defaultValue=64)]
		public var mDepth:Number = 64;


		/**
		 * Notes
		 */

		[Inspectable(defaultValue="",type="String")]
		public var notes:String = "";



	}

}