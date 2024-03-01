import {defer} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context}) {
  const {storefront} = context;
  const {collections} = await storefront.query(FEATURED_COLLECTION_QUERY);
  const featuredCollection = collections.nodes[0];
    const recommendedProducts = storefront.query(RECOMMENDED_PRODUCTS_QUERY);

  return defer({featuredCollection, recommendedProducts});
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
    return (
    <div className="home">
      <div className='video-section'>
        <video autoplay muted playsinline loop controls height="100%" width="100%">
          <source src="https://cdn.shopify.com/videos/c/o/v/5b51c52b09564b59999aaa69b5ae90a7.mp4" type="video/mp4"/>
        </video>
      </div>

      <div className='image-section'> 
        <a href="/products/custom-bundle-1">
          <img src='https://cdn.shopify.com/s/files/1/0555/1751/1961/files/Desktop_Lemon_Pepper.jpg?v=1704755455'/>
        </a>
      </div>

      <div className='imag-text-section displayflex'>
        <div className='pig-bg-image'></div>
        <div class="pig-text">
          <h1>Elevate Your Plate</h1>
          <a href="/products/custom-bundle-1">Order Now</a>
          <p>No Artificial Colors / No Artificial Flavors / Grass-Fed & Grass-Finished Beef Premium Quality / Money-back Guarantee</p>
        </div>
      </div>

      <div className='product-image-order-step-section'>
              <div className='product-image-order-step-container'>
          <div className="displayflex">
            <div className='your-protein-routine-text'>
                <h1 className='text-color-white'>Your Protein Routine</h1>
                <p className='text-color-white'>The hardest part of meal prepping has never been easier! Simply order your meats, prepare for delivery, and reheat with the included directions. Plate up with your favorite sides a delicious and carefree meal.</p>
                <a href="/products/custom-bundle-1"  className='btn-color-white'>Order Now</a>
            </div>
            <div className='your-protein-routine-img'>
                <div className="displayflex">
                  <div className='protein-img-width'>
                    <img src="https://cdn.shopify.com/s/files/1/0555/1751/1961/files/Hannah_Zoomed.jpg?v=1702934270"/>
                  </div>
                  <div className='protein-img-width'>
                    <img src="https://cdn.shopify.com/s/files/1/0555/1751/1961/files/Hannah_Tall2.jpg?v=1701447856"/>
                  </div>
                  <div className='protein-img-width'>
                    <img src="https://cdn.shopify.com/s/files/1/0555/1751/1961/files/Hannah_Zoomed3.jpg?v=1702934278"/>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      <FeaturedCollection collection={data.featuredCollection} />
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({collection}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
          </Link>
    
  );
}

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery>;
 * }}
 */
function RecommendedProducts({products}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {({products}) => (
            <div className="recommended-products-grid">
              {products.nodes.map((product) => (
                <Link
                  key={product.id}
                  className="recommended-product"
                  to={`/products/${product.handle}`}
                >
                  <Image
                    data={product.images.nodes[0]}
                    aspectRatio="1/1"
                    sizes="(min-width: 45em) 20vw, 50vw"
                  />
                  <h4>{product.title}</h4>
                  <small>
                    <Money data={product.priceRange.minVariantPrice} />
                  </small>
                </Link>
              ))}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
